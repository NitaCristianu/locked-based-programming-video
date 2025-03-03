#version 300 es
precision highp float;
#define PI 3.14159265359

// Hash without Sine
// Creative Commons Attribution-ShareAlike 4.0 International Public License
// Created by David Hoskins.
// changes made by AndreiCN

in vec2 screenUV;
in vec2 sourceUV;
in vec2 destinationUV;

out vec4 outColor;

uniform float offsetX;

uniform float time;
uniform float deltaTime;
uniform float framerate;
uniform int frame;
uniform vec2 resolution;
uniform sampler2D sourceTexture;
uniform sampler2D destinationTexture;
uniform mat4 sourceMatrix;
uniform mat4 destinationMatrix;

#define barWidth 0.002
#define slideValY 0.5
#define slideValX 0.5
#define ITERATIONS 4

#define HASHSCALE1 .1031
#define HASHSCALE3 vec3(.1031, .1030, .0973)
#define HASHSCALE4 vec4(.1031, .1030, .0973, .1099)

float hash11(float p) {
    vec3 p3  = fract(vec3(p) * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

float hash12(vec2 p) {
    vec3 p3  = fract(vec3(p.xyx) * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

float hash13(vec3 p3) {
    p3  = fract(p3 * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 hash21(float p) {
    vec3 p3 = fract(vec3(p) * HASHSCALE3);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.xx+p3.yz)*p3.zy);
}

vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
    p3 += dot(p3, p3.yzx+19.19);
    return fract((p3.xx+p3.yz)*p3.zy);
}

vec2 hash23(vec3 p3) {
    p3 = fract(p3 * HASHSCALE3);
    p3 += dot(p3, p3.yzx+19.19);
    return fract((p3.xx+p3.yz)*p3.zy);
}

vec3 hash31(float p) {
    vec3 p3 = fract(vec3(p) * HASHSCALE3);
    p3 += dot(p3, p3.yzx+19.19);
    return fract((p3.xxy+p3.yzz)*p3.zyx);
}

vec3 hash32(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
    p3 += dot(p3, p3.yxz+19.19);
    return fract((p3.xxy+p3.yzz)*p3.zyx);
}

vec3 hash33(vec3 p3) {
    p3 = fract(p3 * HASHSCALE3);
    p3 += dot(p3, p3.yxz+19.19);
    return fract((p3.xxy + p3.yxx)*p3.zyx);
}

vec4 hash41(float p) {
    vec4 p4 = fract(vec4(p) * HASHSCALE4);
    p4 += dot(p4, p4.wzxy+19.19);
    return fract((p4.xxyz+p4.yzzw)*p4.zywx);
}

vec4 hash42(vec2 p) {
    vec4 p4 = fract(vec4(p.xyxy) * HASHSCALE4);
    p4 += dot(p4, p4.wzxy+19.19);
    return fract((p4.xxyz+p4.yzzw)*p4.zywx);
}

vec4 hash43(vec3 p) {
    vec4 p4 = fract(vec4(p.xyzx)  * HASHSCALE4);
    p4 += dot(p4, p4.wzxy+19.19);
    return fract((p4.xxyz+p4.yzzw)*p4.zywx);
}

vec4 hash44(vec4 p4) {
    p4 = fract(p4  * HASHSCALE4);
    p4 += dot(p4, p4.wzxy+19.19);
    return fract((p4.xxyz+p4.yzzw)*p4.zywx);
}

const float arrow_density = 4.5;
const float arrow_length = .45;

const int iterationTime1 = 40;
const int iterationTime2 = 40;
const int vector_field_mode = 0;
const float scale =  6.;

const float velocity_x = 0.025;
const float velocity_y = 0.05;

const float mode_2_speed = 0.15;
const float mode_1_detail = 100.;
const float mode_1_twist = 40.;

const bool isArraw = true;

const vec3 luma = vec3(0.2126, 0.7152, 0.0722);

float f(in vec2 p) {
    return sin(p.x+sin(p.y+time*velocity_x)) * sin(p.y*p.x*0.1+time*velocity_y);
}

struct Field {
    vec2 vel;
    vec2 pos;
};

//---------------Field to visualize defined here-----------------

Field field(in vec2 p,in int mode) {
    Field field;
    if(mode == 0) {
        vec2 ep = vec2(0.05,0.);
        vec2 rz= vec2(0);
        //# centered grid sampling
        for(int i=0; i<iterationTime1; i++) {
            float t0 = f(p);
            float t1 = f(p + ep.xy);
            float t2 = f(p + ep.yx);
            vec2 g = vec2((t1-t0), (t2-t0))/ep.xx;
            vec2 t = vec2(-g.y,g.x);

            //# need update 'p' for next iteration,but give it some change.
            p += (mode_1_twist*0.01)*t + g*(1./mode_1_detail);
            p.x = p.x + sin(time*mode_2_speed/10.)/10.;
            p.y = p.y + cos(time*mode_2_speed/10.)/10.;
            rz= g;
        }
        field.vel = rz;
        return field;
    }

    if(mode == 1) {
        vec2 ep = vec2(0.05,0.);
        vec2 rz= vec2(0);
        //# centered grid sampling
        for(int i=0; i<iterationTime1; i++) {
            float t0 = f(p);
            float t1 = f(p + ep.xy);
            float t2 = f(p + ep.yx);
            vec2 g = vec2((t1-t0), (t2-t0))/ep.xx;
            vec2 t = vec2(-g.y,g.x);

            //# need update 'p' for next iteration,but give it some change.
            p += (mode_1_twist*0.01)*t + g*(1./mode_1_detail);
            p.x = p.x + sin(time*mode_2_speed/10.)/10.;
            p.y = p.y + cos(time*mode_2_speed/10.)/10.;
            rz= g;
        }

        field.vel = rz;
        // add curved effect into curved mesh
        for(int i=1; i<iterationTime2; i++) {
            //# try comment these 2 lines,will give more edge effect
            p.x+=0.3/float(i)*sin(float(i)*3.*p.y+time*mode_2_speed) + 0.5;
            p.y+=0.3/float(i)*cos(float(i)*3.*p.x + time*mode_2_speed) + 0.5;
        }
        field.pos = p;
        return field;
    }

    return field;
}

float segm(in vec2 p, in vec2 a, in vec2 b) {
    //from iq
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa,ba)/dot(ba,ba), 0., 1.);
    return length(pa - ba*h)*20.*arrow_density;
}

float fieldviz(in vec2 p,in int mode) {
    vec2 ip = floor(p*arrow_density)/arrow_density + .5/arrow_density;   
    vec2 t = field(ip,mode).vel;
    float m = min(0.1,pow(length(t),0.5)*(arrow_length/arrow_density));
    vec2 b = normalize(t)*m;
    float rz = segm(p, ip, ip+b);
    vec2 prp = (vec2(-b.y,b.x));
    rz = min(rz,segm(p, ip+b, ip+b*0.65+prp*0.3));
    return clamp(min(rz,segm(p, ip+b, ip+b*0.65-prp*0.3)),0.,1.);
}

vec3 getRGB(in Field fld,in int mode) {
    if(mode == 0) {
        vec2 p = fld.vel;
        vec3 origCol = vec3(p * 0.5 + 0.5, 1.5);
        return origCol;
    }

    if(mode == 1) {
        vec2 p = fld.pos;
        float r=cos(p.x+p.y+1.)*.5+.5;
        float g=sin(p.x+p.y+1.)*.5+.5;
        float b=(sin(p.x+p.y)+cos(p.x+p.y))*.3+.5;
        vec3 col = sin(vec3(-.3,0.1,0.5)+p.x-p.y)*0.65+0.35;
        return vec3(r,g,b);
    }
}

void main() {
    vec2 p = sourceUV-0.5;
    p *= scale;
    p.x += offsetX;

    vec3 col;
    float fviz;

    int vector_mode = 0;
    Field fld = field(p,vector_mode);
    col = getRGB(fld,vector_mode) * .85;    
    outColor = vec4(col,1.0);
}